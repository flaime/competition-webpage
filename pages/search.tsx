import { GetStaticProps } from "next";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/router";
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
  Title,
} from "@mantine/core";

import { PreConfiguredHeadermenue } from "../components/PreConfiguredHeadermenue";
import { getCompetitions, getLiveCompetition } from "../components/helerFile";
import { Bana, Competiton, Metadata, Race } from "../components/entities";

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

function filterCompetitionByQueries(
  competition: Competiton,
  queries: string[],
  isLive: boolean,
): Match[] {
  if (!queries || queries.length === 0) return [];

  const qs = queries.map((q) => normalizeStr(q)).filter(Boolean);
  if (qs.length === 0) return [];

  const matches: Match[] = [];
  for (const race of competition.races) {
    if (!race?.banor || race.banor.length === 0) continue;

    for (const lane of race.banor) {
      if (!lane?.namn) continue;
      const laneName = normalizeStr(lane.namn);
      if (qs.some((q) => laneName.includes(q))) {
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

function groupMatches(matches: Match[]): Array<{
  key: string;
  competitionName: string;
  competitionPlace?: string | null;
  competitionDates?: string | null;
  races: Array<{ race: Race; lanes: Bana[]; isLive: boolean }>;
}> {
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

function asArray(q: string | string[] | undefined): string[] {
  if (q === undefined) return [];
  return Array.isArray(q) ? q : [q];
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export default function SearchPage({
  competitions,
  liveMeta,
}: SearchPageProps) {
  const { classes } = useStyles();
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);

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

  const [queries, setQueries] = useState<string[]>([]);
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

  // Hydrate state from URL on load/back/forward
  useEffect(() => {
    if (!router.isReady) return;
    const urlNames = asArray(router.query.names);
    const compParam = (router.query.competitions ?? router.query.comps) as
      | string
      | string[]
      | undefined;
    const urlComps = asArray(compParam);

    const nextComps = urlComps.length ? urlComps : allDefaults;

    let changed = false;
    if (!arraysEqual(queries, urlNames)) {
      setQueries(urlNames);
      changed = true;
    }
    if (!arraysEqual(selectedCompetitions, nextComps)) {
      setSelectedCompetitions(nextComps);
      changed = true;
    }
    if (changed || !hydrated) {
      setHydrated(true);
    }
  }, [
    router.isReady,
    router.query.names,
    router.query.competitions,
    router.query.comps,
    allDefaults,
    hydrated,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist state to URL (shallow)
  useEffect(() => {
    if (!router.isReady || !hydrated) return;

    const currentNames = asArray(router.query.names);
    const compParam = (router.query.competitions ?? router.query.comps) as
      | string
      | string[]
      | undefined;
    const currentComps = asArray(compParam);

    const desiredNames = queries;
    const desiredComps = selectedCompetitions;

    const nextQuery: Record<string, any> = { ...router.query };

    // Only include names if any selected
    if (desiredNames.length) nextQuery.names = desiredNames;
    else delete nextQuery.names;

    // Always persist competitions under canonical 'competitions' param
    nextQuery.competitions = desiredComps;
    if ("comps" in nextQuery) delete nextQuery.comps;

    const namesEqual = arraysEqual(currentNames, desiredNames);
    const compsEqual = arraysEqual(currentComps, desiredComps);

    if (namesEqual && compsEqual) return;

    router.replace(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true },
    );
  }, [queries, selectedCompetitions, hydrated, router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const nameOptions = useMemo(() => {
    const selected = new Set(selectedCompetitions);
    const names = new Set<string>();

    // Static competitions
    for (const c of competitions) {
      if (!selected.has(c.name)) continue;
      for (const race of c.races) {
        if (!race?.banor) continue;
        for (const lane of race.banor) {
          if (lane?.namn) names.add(lane.namn);
        }
      }
    }

    // Live competition
    if (
      liveMeta.livedataActive &&
      selected.has(liveMeta.liveData.name) &&
      liveCompetition
    ) {
      for (const race of liveCompetition.races) {
        if (!race?.banor) continue;
        for (const lane of race.banor) {
          if (lane?.namn) names.add(lane.namn);
        }
      }
    }

    // Ensure selected query values are always present in the options
    for (const q of queries) names.add(q);

    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((n) => ({ value: n, label: n }));
  }, [competitions, selectedCompetitions, liveMeta, liveCompetition, queries]);

  const matches = useMemo(() => {
    const selected = new Set(selectedCompetitions);

    const results: Match[] = [];

    // Static competitions
    for (const c of competitions) {
      if (!selected.has(c.name)) continue;
      results.push(...filterCompetitionByQueries(c, queries, false));
    }

    // Live competition (if selected and loaded)
    if (
      liveMeta.livedataActive &&
      selected.has(liveMeta.liveData.name) &&
      liveCompetition
    ) {
      results.push(
        ...filterCompetitionByQueries(liveCompetition, queries, true),
      );
    }

    return groupMatches(results);
  }, [competitions, liveCompetition, liveMeta, queries, selectedCompetitions]);

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
          tävlingar. Särskilt användbar under live-tävlingar.
        </Text>

        <Space h="md" />

        <Stack spacing="sm" className={classes.stickyFilters}>
          <MultiSelect
            label="Namn eller lag"
            data={nameOptions}
            value={queries}
            onChange={setQueries}
            searchable
            clearable
            nothingFound="Inga namn funna"
            placeholder='Exempel: "Carl" eller "Huskvarna"'
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

        {!queries.length ? (
          <Card withBorder radius="md" p="lg">
            <Text size="sm" className={classes.muted}>
              Skriv ett namn eller lag i sökrutan ovan för att se matchande lopp
              och banor.
            </Text>
          </Card>
        ) : null}

        {queries.length > 0 &&
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

        {queries.length > 0 && matches.length === 0 ? (
          <Card withBorder radius="md" p="lg">
            <Text>
              Inga resultat för “{queries.join(", ")}” i de valda tävlingarna.
            </Text>
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
