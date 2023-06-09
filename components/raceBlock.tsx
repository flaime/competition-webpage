
import { createStyles, Table, Progress, Anchor, Text, Group, ScrollArea, Container, Avatar, BadgeStylesNames, Card, Button, Center, Grid, Badge, SimpleGrid } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Race } from './entities';
import getRace from './race';

interface RaceBlokProps {
  race: Race,
  competitionName: string
}

export default function getRaceBlock(props: RaceBlokProps) {
  const router = useRouter();
  return (
    <Card withBorder radius="md" p="xl" > {/*className={classes.card}>*/}
      <Grid justify="flex-end">
        <Grid.Col span="auto">
          <Text size="lg" weight={500} color={"blue.8"}>
            {/*<Text size="lg" className={classes.title} weight={500}>*/}
            {props.race.loppInfo}
          </Text>
        </Grid.Col>
        <Grid.Col span={"content"}>
          <Badge variant="gradient" gradient={{ from: 'cyan', to: 'indigo' }}>
            {props.race.loppTid}
          </Badge>
        </Grid.Col>
      </Grid>


      {/*<Group style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} spacing="sm" >*/}
      <Grid justify="flex-end">
        <Grid.Col span="auto">
          <Text size="xs" color="dimmed" mt={3} mb="xl">
            {"Lopp: " + props.race.loppnummer}
          </Text>
        </Grid.Col>
        <Grid.Col span={"content"}>
          <Link href={'/' + props.competitionName + '/' + props.race.loppnummer}>
            <Button variant="default" size="xs" compact >
              Gå till lopp
            </Button>
          </Link>
        </Grid.Col>
      </Grid>
      {/*items*/}
      {getRace(props.race)}
    </Card>

  );
}
