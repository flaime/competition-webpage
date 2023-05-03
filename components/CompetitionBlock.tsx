
import { Carousel } from '@mantine/carousel';
import { createStyles, Table, Progress, Anchor, Text, Group, ScrollArea, Container, Avatar, BadgeStylesNames, Card, Button, Center, Grid, Badge, SimpleGrid } from '@mantine/core';
import { useRouter } from 'next/router';
import { Competiton, Race } from './entities';
import Link from 'next/link';


interface CompetitionBlokProps {
  competiton: Competiton
  keyyy: string | number;
}

const useStyles = createStyles((theme) => ({
  linkButton: {
    textDecoration: "none",
  },
  link: {
    all: "unset",
    cursor: "pointer"
  }
}))


export default function CompetitionBlock({ competiton, keyyy }: CompetitionBlokProps) {
  const router = useRouter();
  const { classes } = useStyles();

  const slides = competiton.races.filter(race => {
    if (race.info == true || (typeof race.loppnummer === "string" && race.banor.length == 0))
      return false
    else
      return true
  }).map((race) => (
    <Carousel.Slide key={race.loppnummer + (race.loppInfo ?? "") + competiton.name}>
      <Card shadow="sm" p="lg" radius="md" withBorder>

        <Group position="apart" mt="md" mb="xs">
          <Link className={classes.linkButton} href={"/" + competiton.name + "/" + race.loppnummer}><Text weight={500} color={"blue.8"}>{race.loppInfo}</Text></Link>
          <Badge variant="gradient" gradient={{ from: 'cyan', to: 'indigo' }}>
            {race.loppTid}
          </Badge>
        </Group>

        <Text size="sm" color="dimmed">
          <strong>{"lopp " + race.loppnummer}</strong> <Link className={classes.link} href={"/" + competiton.name}>{" - " + competiton.name}</Link>
        </Text>
      </Card>
    </Carousel.Slide>
  ));
  return (

    <Card withBorder radius="md" p="xl" > {/*className={classes.card}>*/}
      <Grid justify="flex-start">
        <Grid.Col span="auto">
          <Text size="lg" weight={500} color={"blue.8"}>
            {/*<Text size="lg" className={classes.title} weight={500}>*/}
            {competiton.name}
          </Text>
        </Grid.Col>
        <Grid.Col span={"content"}>
          <Badge variant="gradient" gradient={{ from: 'cyan', to: 'indigo' }}>
            {competiton.place}
          </Badge>
        </Grid.Col>
      </Grid>


      {/*<Group style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} spacing="sm" >*/}
      <Grid justify="flex-end">
        <Grid.Col span="auto">
          <Text size="xs" color="dimmed" mt={3} mb="xl">
            {competiton.dates}
          </Text>
        </Grid.Col>
        <Grid.Col span={"content"}>
          <Link href={'/' + competiton.name}>
            <Button variant="default" size="xs" compact >
              Se alla lopp
            </Button>
          </Link>
        </Grid.Col>
      </Grid>
      <Carousel slideSize="70%" slideGap="md" controlsOffset="md" dragFree align={"start"}>
        {slides}
      </Carousel>
      {/*items*/}
      {/* {getRace(props.race)} */}
    </Card>

  );
}
