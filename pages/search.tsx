import { GetStaticProps } from "next";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Badge,
  Card,
  Container,
  createStyles,
  Grid,
  Group,
  MultiSelect,
  Skeleton,
  Space,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { PreConfiguredHeadermenue } from "../components/PreConfiguredHeadermenue";
import { getCompetitions, getLiveCompetition } from "../components/helerFile";
import {
  Bana,
  Competiton,
  LiveData,
  Metadata,
  Race,
} from "../components/entities";

interface SearchPageProps {
  competitions: Competiton[];
  liveMeta: Metadata;
}

const useStyles = createStyles(() => ({
  onHover: {
    cursor: "pointer",
  },
  muted: {
    color: "#868e96",
  },
  stickyFilters: {
    position: "sticky",
    top: 8,
    zIndex: 1,
    background: "white",
    paddingTop: 8,
    paddingBottom: 8,
  },
}));

type LiveFetcherKey = null | {
  url: string;
  competitionName: string;
  info: string;
  dates: string;
  place: string;
};

const liveFetcher = async (
  key: LiveFetcherKey,
): Promise<Competiton | undefined> => {
  if (!key) return undefined;
  const res = await fetch(key.url);
  const json = await res.json();
  const races: Race[] = json.data ?? [];
  return {
    name: key.competitionName,
    info: key.info,
    dates: key.dates,
    place: key.place,
    races,
  };
};

function normalizeStr(value: string | undefined | null): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type Match = {
  competitionName: string;
  competitionPlace?: string | null;
  competitionDates?: string | null;
  race: Race;
  lane: Bana;
  isLive: boolean;
};

function filterCompetitionByQuery(
  competition: Competiton,
  query: string,
  isLive: boolean,
): Match[] {
  const q = normalizeStr(query);
  if (!q) return [];

  const matches: Match[] = [];
  for (const race of competition.races) {
    if (!race?.banor || race.banor.length === 0) continue;

    for (const lane of race.banor) {
      if (!lane?.namn) continue;
      if (normalizeStr(lane.namn).includes(q)) {
        matches.push({
          competitionName: competition.name,
          competitionPlace: competition.place,
          competitionDates: competition.dates,
          race,
          lane,
          isLive,
        });
      }
    }
  }
  return matches;
}

function groupMatches(
  matches: Match[],
): Array<{
  key: string;
  competitionName: string;
  competitionPlace?: string | null;
  competitionDates?: string | null;
  races: Array<{ race: Race; lanes: Bana[]; isLive: boolean }>;
}> {
  // Group first by competition, then by race number
  const byCompetition = new Map<
    string,
    {
      competitionName: string;
      competitionPlace?: string | null;
      competitionDates?: string | null;
      races: Map<
        number | string,
        { race: Race; lanes: Bana[]; isLive: boolean }
      >;
    }
  >();

  for (const m of matches) {
    if (!byCompetition.has(m.competitionName)) {
      byCompetition.set(m.competitionName, {
        competitionName: m.competitionName,
        competitionPlace: m.competitionPlace,
        competitionDates: m.competitionDates,
        races: new Map(),
      });
    }
    const comp = byCompetition.get(m.competitionName)!;

    const raceKey =
      m.race.loppnummer ?? `${m.race.loppInfo ?? ""}-${m.race.loppTid ?? ""}`;
    if (!comp.races.has(raceKey)) {
      comp.races.set(raceKey, { race: m.race, lanes: [], isLive: m.isLive });
    }
    comp.races.get(raceKey)!.lanes.push(m.lane);
  }

  return Array.from(byCompetition.values()).map((c) => ({
    key: c.competitionName,
    competitionName: c.competitionName,
    competitionPlace: c.competitionPlace,
    competitionDates: c.competitionDates,
    races: Array.from(c.races.values()),
  }));
}

export const getStaticProps: GetStaticProps<SearchPageProps> = async () => {
  const competitions = await getCompetitions();
  const liveMeta = await getLiveCompetition();

  return {
    props: {
      competitions,
      liveMeta,
    },
  };
};

export default function SearchPage({
  competitions,
  liveMeta,
}: SearchPageProps) {
  const { classes } = useStyles();

  // Build the selector list of competitions including LIVE (if active)
  const competitionOptions = useMemo(() => {
    const options = competitions.map((c) => ({ value: c.name, label: c.name }));
    if (liveMeta.livedataActive) {
      options.unshift({
        value: liveMeta.liveData.name,
        label: `LIVE — ${liveMeta.liveData.name}`,
      });
    }
    return options;
  }, [competitions, liveMeta]);

  const allDefaults = useMemo(
    () => competitionOptions.map((o) => o.value),
    [competitionOptions],
  );

  const [query, setQuery] = useState("");
  const [selectedCompetitions, setSelectedCompetitions] =
    useState<string[]>(allDefaults);

  // LIVE data via SWR (client-side, refresh 15s)
  const liveKey: LiveFetcherKey = liveMeta.livedataActive
    ? {
        url: liveMeta.liveData.url,
        competitionName: liveMeta.liveData.name,
        info: liveMeta.liveData.info,
        dates: liveMeta.liveData.dates,
        place: liveMeta.liveData.place,
      }
    : null;

  const { data: liveCompetition, isLoading: liveLoading } = useSWR(
    liveKey,
    liveFetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: false,
    },
  );

  const matches = useMemo(() => {
    const selected = new Set(selectedCompetitions);
    const q = query.trim();

    const results: Match[] = [];

    // Static competitions
    for (const c of competitions) {
      if (!selected.has(c.name)) continue;
      results.push(...filterCompetitionByQuery(c, q, false));
    }

    // Live competition (if selected and loaded)
    if (
      liveMeta.livedataActive &&
      selected.has(liveMeta.liveData.name) &&
      liveCompetition
    ) {
      results.push(...filterCompetitionByQuery(liveCompetition, q, true));
    }

    return groupMatches(results);
  }, [competitions, liveCompetition, liveMeta, query, selectedCompetitions]);

  const isLiveSelected = selectedCompetitions.includes(
    liveMeta?.liveData?.name ?? "__no_live__",
  );

  return (
    <>
      <PreConfiguredHeadermenue
        competitions={competitions}
        liveCompetition={
          liveMeta.livedataActive ? [liveMeta.liveData.name] : []
        }
      />
      <Container my="md">
        <Title order={1}>Sök lopp och banor</Title>
        <Text size="sm" className={classes.muted}>
          Filtrera på deltagare/lag (ban-namn) och begränsa till valda
          tävlingar.
        </Text>

        <Space h="md" />

        <Stack spacing="sm" className={classes.stickyFilters}>
          <TextInput
            label="Namn eller lag"
            placeholder='Exempel: "Carl" eller "Huskvarna"'
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
          <MultiSelect
            label="Tävlingar"
            data={competitionOptions}
            value={selectedCompetitions}
            onChange={setSelectedCompetitions}
            searchable
            clearable
            nothingFound="Inga tävlingar"
            placeholder="Välj en eller flera tävlingar"
          />
        </Stack>

        <Space h="md" />

        {!query.trim() ? (
          <Card withBorder radius="md" p="lg">
            <Text size="sm" className={classes.muted}>
              Skriv ett namn eller lag i sökrutan ovan för att se matchande lopp
              och banor.
            </Text>
          </Card>
        ) : null}

        {query.trim() &&
        liveMeta.livedataActive &&
        isLiveSelected &&
        liveLoading ? (
          <Card withBorder radius="md" p="lg">
            <Group position="apart" mb="xs">
              <Text weight={500}>Hämtar live-data…</Text>
              <Badge
                variant="gradient"
                gradient={{ from: "cyan", to: "indigo" }}
              >
                LIVE
              </Badge>
            </Group>
            <Skeleton height={8} mt={6} radius="xl" />
            <Skeleton height={8} mt={6} radius="xl" width="70%" />
            <Skeleton height={8} mt={6} radius="xl" width="40%" />
          </Card>
        ) : null}

        <Space h="xs" />

        {query.trim() && matches.length === 0 ? (
          <Card withBorder radius="md" p="lg">
            <Text>Inga resultat för “{query}” i de valda tävlingarna.</Text>
          </Card>
        ) : null}

        <Stack spacing="lg">
          {matches.map((comp) => (
            <Card key={comp.key} withBorder radius="md" p="xl">
              <Grid justify="flex-start" align="center">
                <Grid.Col span="auto">
                  <Group spacing="xs">
                    <Text size="lg" weight={600} color="blue.8">
                      {comp.competitionName}
                    </Text>
                  </Group>
                </Grid.Col>
                {comp.competitionPlace ? (
                  <Grid.Col span="content">
                    <Badge
                      variant="gradient"
                      gradient={{ from: "cyan", to: "indigo" }}
                    >
                      {comp.competitionPlace}
                    </Badge>
                  </Grid.Col>
                ) : null}
              </Grid>
              {comp.competitionDates ? (
                <Text size="xs" color="dimmed" mt={3} mb="md">
                  {comp.competitionDates}
                </Text>
              ) : null}

              <Stack spacing="md">
                {comp.races.map(({ race, lanes, isLive }) => {
                  const raceNr = race.loppnummer?.toString?.() ?? "";
                  const href = isLive
                    ? `/${comp.competitionName}#${raceNr}`
                    : `/${comp.competitionName}/${raceNr}`;

                  return (
                    <Card
                      key={`${comp.competitionName}-${raceNr}-${race.loppInfo ?? ""}`}
                      withBorder
                      radius="md"
                      p="md"
                    >
                      <Group position="apart" mb="xs">
                        <Group spacing="xs">
                          <Text weight={500} color="blue.8">
                            {race.loppInfo ?? "Lopp"}
                          </Text>
                          {isLive ? (
                            <Badge
                              variant="gradient"
                              gradient={{ from: "grape", to: "violet" }}
                            >
                              LIVE
                            </Badge>
                          ) : null}
                        </Group>
                        {race.loppTid ? (
                          <Badge
                            variant="gradient"
                            gradient={{ from: "cyan", to: "indigo" }}
                          >
                            {race.loppTid}
                          </Badge>
                        ) : null}
                      </Group>

                      <Text size="sm" color="dimmed" mb="sm">
                        {raceNr ? `Lopp: ${raceNr}` : null}
                      </Text>

                      <Table striped highlightOnHover verticalSpacing="xs">
                        <thead>
                          <tr>
                            <th>Bana</th>
                            <th>Klubb</th>
                            <th>Tid</th>
                            <th>Placering</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lanes.map((lane, idx) => (
                            <tr
                              key={`${lane.namn ?? "namn"}-${lane.bana ?? idx}-${raceNr}`}
                            >
                              <td>{lane.bana}</td>
                              <td>{lane.namn}</td>
                              <td>{lane.tid}</td>
                              <td>{lane.placering}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>

                      {raceNr ? (
                        <Group position="right" mt="sm">
                          <Link href={href} legacyBehavior>
                            <a>
                              <Badge radius="sm" variant="outline">
                                Visa lopp
                              </Badge>
                            </a>
                          </Link>
                        </Group>
                      ) : null}
                    </Card>
                  );
                })}
              </Stack>
            </Card>
          ))}
        </Stack>
      </Container>
    </>
  );
}
