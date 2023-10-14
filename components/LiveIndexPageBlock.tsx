
import { Text, Card, Button, Grid, Badge } from '@mantine/core';
import Link from 'next/link';
import { Competiton, LiveData } from './entities';
import Pulsing from './pulsing/Pulsing';
import useSWR from 'swr'
import CompeitionProgram from "./CompeitionProgram";

interface LiveIndexPageBlockProps {
  livedata: LiveData
}
interface FecerProps {
  url: string,
  competitionName:string
}

const fetcher = (fecerProps:FecerProps): Promise<Competiton> => fetch(fecerProps.url)
  .then((res) => res.json())
  .then((json) => {
    return {
      name: fecerProps.competitionName,
      info: null,
      place: null,
      dates: null,
      races: json.data
    }
  });

export default function LiveIndexPageBlock({ livedata }: LiveIndexPageBlockProps) {

  const { data, error } = useSWR({url:livedata.url, competitionName:livedata.name}, fetcher, { refreshInterval: 15000 })

  return (
    <>
      <Card withBorder radius="md" p="xl" >
        <Grid justify="flex-start" align={"center"}>
          <Grid.Col span="content">
            <Pulsing />
          </Grid.Col>
          <Grid.Col span="auto">
            <Text size="lg" weight={500} color={"blue.8"}>
              {livedata.name}
            </Text>
          </Grid.Col>
          <Grid.Col span={"content"}>
            <Badge variant="gradient" gradient={{ from: 'cyan', to: 'indigo' }}>
              {livedata.place}
            </Badge>
          </Grid.Col>
        </Grid>

        <Grid justify="flex-end">
          <Grid.Col span="auto">
            <Text size="xs" color="dimmed" mt={3} mb="xl">
              {livedata.name}
            </Text>
          </Grid.Col>
          <Grid.Col span={"content"}>
            <Link href={'/' + livedata.name}>
              <Button variant="default" size="xs" compact>
                Se alla lopp
              </Button>
            </Link>
          </Grid.Col>
        </Grid>

        <CompeitionProgram loading={data == undefined } competition={data} clickType={"toRaceBlock"} />
      </Card>

    </>

  );
}