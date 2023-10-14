
import { createStyles, Table, Text, Card, Button, Grid, Badge, Skeleton } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Competiton, LiveData } from './entities';
import Pulsing from './pulsing/Pulsing';
import useSWR from 'swr'
import { useEffect, useState } from 'react';

interface LiveIndexPageBlockProps {
  livedata: LiveData
}

const useStyles = createStyles((theme) => ({
  onHover: {
    cursor: "pointer",
    backgroundColor: '#fff',
    '&:hover': {
      backgroundColor: '#f1f3f5',
    },
  }
}))

// const fetcher = (...args) => fetch(...args).then((res) => res.json())

const fetcher = (url: string): Promise<Competiton> => fetch(url)
  .then((res) => res.json())
  .then((json) => {
    return {
      name: "hej",
      info: null,
      place: null,
      dates: null,
      races: json.data
    }
  });

function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function LiveIndexPageBlock({ livedata }: LiveIndexPageBlockProps) {
  const router = useRouter();
  const { classes } = useStyles();

  const { data, error } = useSWR(livedata.url, fetcher, { refreshInterval: 15000 })

  const rows = data?.races.map((race) => (

    <tr key={race.loppnummer + (race.loppInfo ?? "") + race.loppTid} className={race.banor.length > 0 ? classes.onHover : undefined} onClick={() => { race.banor.length > 0 ? router.push("/" + race.loppnummer) : null }}>
      <td>{race.loppnummer}</td>
      <td>{race.loppInfo}</td>
      <td>{race.loppTid}</td>
    </tr >

  ));

  const [loadRows, setLoadRows] = useState<Array<JSX.Element>>([
    <tr key={0} >
      <td colSpan={3}><Skeleton height={8} mt={6} radius="xl" width={"70%"} /></td>
    </tr>
  ])


  useEffect(() => {
    var counter = 0;
    const myInterval = setInterval(() => {
      counter = counter + 1
      setLoadRows((prevLoadRows) => [...prevLoadRows,
      <tr key={prevLoadRows.length} >
        <td colSpan={3}><Skeleton height={8} mt={6} radius="xl" width={randomNumber(20, 90).toString() + "%"} /></td>
      </tr>
      ])
      if (counter > 20) { //max 20 elements in the list before stop
        clearInterval(myInterval)
      }
    }, 300);
    // clear out the interval using the id when unmounting the component
    return () => clearInterval(myInterval);
  }, []);

  return (
    <>
      <Card withBorder radius="md" p="xl" > {/*className={classes.card}>*/}
        <Grid justify="flex-start" align={"center"}>
          <Grid.Col span="content">
            <Pulsing />
          </Grid.Col>
          <Grid.Col span="auto">
            <Text size="lg" weight={500} color={"blue.8"}>
              {/*<Text size="lg" className={classes.title} weight={500}>*/}
              {livedata.name}
            </Text>
          </Grid.Col>
          <Grid.Col span={"content"}>
            <Badge variant="gradient" gradient={{ from: 'cyan', to: 'indigo' }}>
              {livedata.place}
            </Badge>
          </Grid.Col>
        </Grid>


        {/*<Group style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} spacing="sm" >*/}
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

        <Table>
          <thead>
            <tr>
              <th>Nr</th>
              <th>Lopp</th>
              <th>Tid</th>
            </tr>
          </thead>

          {rows ?
            <tbody>{rows}</tbody>
            :
            <tbody>{loadRows}</tbody>
          }
        </Table>
      </Card>

    </>

  );
}