import { useRouter } from 'next/router'
import {Competiton, LiveData} from "../components/entities"
import { PreConfiguredHeadermenue } from '../components/PreConfiguredHeadermenue';
import {getCompetitions, getLiveCompetition} from '../components/helerFile';
import { Container, createStyles, Stack } from '@mantine/core';
import { Metadata } from '../components/entities';
import metadataRaw from '../data/liveData.json'
import LiveIndexPageBlock from '../components/LiveIndexPageBlock';
import CompetitionBlock from '../components/CompetitionBlock';
const metadata: Metadata = metadataRaw



export async function getStaticProps() {
  return {
    props: {
      competitions: await getCompetitions(),
      liveData: await getLiveCompetition()
    },
  }
}

interface IndexProps {
  competitions: Competiton[],
  liveData: Metadata
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

export default function Home({ competitions,liveData }: IndexProps) {
  const router = useRouter();
  const { classes } = useStyles();

  return (
    <div>
      <PreConfiguredHeadermenue competitions={competitions} liveCompetition={liveData.livedataActive ? [liveData.liveData.name] : []} />
      <Container>

        { liveData && metadata.livedataActive ?
          <>
            <LiveIndexPageBlock key={metadata.liveData.name} livedata={metadata.liveData} />
          </> : null
        }

        <Stack spacing={"xl"} justify="flex-start" className={classes.padding}>
          {
            competitions.map((competition) =>
              <CompetitionBlock key={competition.name + competition.dates} keyyy={competition.name + competition.dates} competiton={competition} />
            )
          }
        </Stack>
      </Container>
    </div >
  )
}