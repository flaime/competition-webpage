import React, { useState } from 'react';
import { useRouter } from 'next/router'
import { Competiton } from "../components/entities"
import { getRacesBloks } from '../components/races';
import { PreConfiguredHeadermenue } from '../components/PreConfiguredHeadermenue';
import { getCompetitions } from '../components/helerFile';
import { Container, createStyles, Stack, Table, List, Button } from '@mantine/core';
import { Metadata } from '../components/entities';
import metadataRaw from '../data/liveData.json'
import NonLiveIndexPageBlock from '../components/LiveIndexPageBlock';
import LiveIndexPageBlock from '../components/LiveIndexPageBlock';
import Pulsing from '../components/pulsing/Pulsing';
import CompetitionBlock from '../components/CompetitionBlock';
const metadata: Metadata = metadataRaw



export async function getStaticProps() {
  return {
    props: {
      competitions: await getCompetitions(),
    },
  }
}

interface IndexProps {
  competitions: Competiton[]
}

const getActivcompetitionFromUrl = (competitions: Competiton[]): Competiton => {
  const router = useRouter();
  const competitionName = router.query.competition
  const competition = competitions.find(competition => competition.name === competitionName)
  const ret = competition ?? competitions[0]
  return ret

}

const useStyles = createStyles((theme) => ({
  onHover: {
    cursor: "pointer"
  },
  padding: {
    paddingTop: 10,
    paddingBottom: 20
  }
}))

// const competitionsBlok = (competitions: Competiton[]): JSX.Element[] => {
//   return competitions.map((competition) =>
//     <CompetitionBlock key={competition.name + competition.dates} keyyy={competition.name + competition.dates} competiton={competition} />
//   )
// }

export default function Home({ competitions }: IndexProps) {
  const router = useRouter();
  const { classes } = useStyles();

  const [activecompetition, setActivecompetition] = useState<Competiton>(getActivcompetitionFromUrl(competitions));

  console.log(metadata)
  return (
    <div>
      <PreConfiguredHeadermenue competitions={competitions} />
      <Container>
        {/* {metadata.livedataActive ?
          <p>livedata</p>
          :
          <NonLiveIndexPageBlock competitions={competitions} />
        } */}

        
        {metadata.livedataActive ?
          <>
            <LiveIndexPageBlock key={metadata.liveData.name} livedata={metadata.liveData} />

          </> : null
        }

        <Stack spacing={"xl"} justify="flex-start" className={classes.padding}>
          {
            competitions.map((competition) =>
              // <Button>hejhjdd</Button>
              <CompetitionBlock key={competition.name + competition.dates} keyyy={competition.name + competition.dates} competiton={competition} />
            )
          }
        </Stack>
      </Container>
    </div >
  )
}