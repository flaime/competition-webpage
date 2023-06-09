import { useRouter } from 'next/router'
import { GetStaticProps, GetStaticPaths } from 'next';
import { Card, Image, Text, Badge, Button, Group, Grid, Container, createStyles } from '@mantine/core';
import { promises as fs } from 'fs'
import path from 'path'
import { Competiton, Race } from '../../components/entities';
import getRace from '../../components/race';
import Link from 'next/link';
import { PreConfiguredHeadermenue } from '../../components/PreConfiguredHeadermenue';
import { getCompetitions } from '../../components/helerFile';


const useStyles = createStyles((theme) => ({
  linkButton: {
    textDecoration: "none",
  },
  link: {
    all: "unset",
    cursor: "pointer"
  }
}))


// async function getData(): Promise<Competiton[]> {
//   const postsDirectory = path.join(process.cwd(), '/data/competitions/')
//   const filenames = await fs.readdir(postsDirectory)

//   const competitions = filenames.map(async (filename) => {
//     const filePath = path.join(postsDirectory, filename)
//     const rawFileContents = await fs.readFile(filePath, 'utf8')

//     // Generally you would parse/transform the contents
//     // For example you can transform markdown to HTML here

//     const file = JSON.parse(rawFileContents)

//     return {
//       name: filename.split(".")[0] ?? "",
//       races: file.data
//     } as Competiton
//   })
//   return await Promise.all(competitions)
// }

export const getStaticPaths: GetStaticPaths = async () => {
  const data: Competiton[] = await getCompetitions();

  const pathsWithParams: {
    params: {
      competition: string;
      raceNr: string;
    };
  }[] = data.map((competiton: Competiton) => competiton.races.map(race => ({ params: { competition: competiton.name, raceNr: race.loppnummer.toString() } }))).flat()
  return {
    paths: pathsWithParams,
    fallback: true
  }
}


export const getStaticProps: GetStaticProps = async (context) => {
  const data: Competiton[] = await getCompetitions();

  const competition = context.params?.competition
  const raceNr = context.params?.raceNr

  const competitionData = data.find(competitionFrmList => competitionFrmList.name === competition)
  const race = competitionData?.races.find(race => race.loppnummer.toString() === raceNr) ?? null

  return {
    props: {
      raceNr: raceNr,
      competition: competition,
      competitionData: competitionData,
      races: race,
      competitions: data,
    },
  }
}

interface RacePageProps {
  raceNr: string,
  competition: string,
  competitionData?: Competiton,
  races?: Race,
  competitions: Competiton[]
}

const previsuRace = (competition: Competiton, activRaceNr: string) => {

  const racePosition = competition.races.findIndex((race: Race) => { return race.loppnummer.toString() === activRaceNr })
  for (let i = racePosition - 1; i >= 0; i--) {
    const loppnummer = competition.races[i].loppnummer
    if (loppnummer == null || loppnummer == undefined || loppnummer.toString() == "") { }
    else
      return competition.races[i]
  }
  return undefined

}

const nextRace = (competition: Competiton, activRaceNr: string) => {

  const racePosition = competition.races.findIndex((race: Race) => { return race.loppnummer.toString() === activRaceNr })

  for (let i = racePosition + 1; i < competition.races.length; i++) {
    const loppnummer = competition.races[i].loppnummer
    if (loppnummer == null || loppnummer == undefined || loppnummer.toString() == "") { }
    else {
      return competition.races[i]
    }
  }
  return undefined

}

export default function CommentPage(prop: RacePageProps) {
  const { classes } = useStyles();

  return (
    <>
      <PreConfiguredHeadermenue competitions={prop.competitions} />
      <Container my="md">
        {prop.races ?
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={"/images/drakbåt.jpg"}
                height={160}
                alt="Norway"
              />
            </Card.Section>

            <Group position="apart" mt="md" mb="xs">
              <Text weight={500} color={"blue.8"}>{prop.races?.loppInfo}</Text>
              <Badge variant="gradient" gradient={{ from: 'cyan', to: 'indigo' }}>
                {prop.races?.loppTid}
              </Badge>
              {/* <Badge color="gray" variant="light">
              {prop.races?.loppTid}
            </Badge> */}
            </Group>

            <Text size="sm" color="dimmed">
              <strong>{"lopp " + prop.raceNr}</strong> <Link className={classes.link} href={"/" + prop.competition}>{" - " + prop.competition}</Link>
            </Text>

            <Grid>
              <Grid.Col span={6}>
                <Link className={classes.linkButton} href={'/' + prop.competition + "/" + previsuRace(prop.competitionData!!, prop.raceNr)?.loppnummer} style={{ pointerEvents: previsuRace(prop.competitionData!!, prop.raceNr) === undefined ? 'none' : "auto" }}>
                  <Button disabled={previsuRace(prop.competitionData!!, prop.raceNr) === undefined} variant="light" color="blue" fullWidth mt="md" radius="md" >
                    Föregående loppet
                  </Button>
                </Link>
              </Grid.Col>
              <Grid.Col span={6}>
                <Link className={classes.linkButton} href={'/' + prop.competition + "/" + nextRace(prop.competitionData!!, prop.raceNr)?.loppnummer} style={{ pointerEvents: nextRace(prop.competitionData!!, prop.raceNr) === undefined ? 'none' : "auto" }} >
                  <Button disabled={nextRace(prop.competitionData!!, prop.raceNr) === undefined} variant="light" color="blue" fullWidth mt="md" radius="md">
                    Nästa lopp
                  </Button>
                </Link>
              </Grid.Col>


            </Grid>
            {getRace(prop.races)}
          </Card>

          : <>
            <h1>Lopp nr {prop.raceNr} för {prop.competition} existerar inte</h1>
            <a href='/'>
              <Button >Tryck här för komma till startisdan</Button>
            </a>
          </>

        }
      </Container>
    </>
  )
}