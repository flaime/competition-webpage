import { GetStaticProps, GetStaticPaths } from 'next';
import { Container, createStyles, Stack, Title, Text, Grid, SimpleGrid, ActionIcon } from '@mantine/core';
import { Competiton } from '../components/entities';
import { getRacesBloks } from '../components/races';
import { PreConfiguredHeadermenue } from '../components/PreConfiguredHeadermenue';
import { getCompetitions } from '../components/helerFile';
import { IconSettings, IconMapPin, IconCalendarEvent, IconInfoCircle } from '@tabler/icons';
import { InfoText } from '../components/InfoText';


const useStyles = createStyles((theme) => ({
    padding: {
        paddingTop: 10,
        paddingBottom: 20
    }
}))

export const getStaticPaths: GetStaticPaths = async () => {
    const data = await getCompetitions()

    const pathsWithParams: {
        params: {
            competition: string;
        };
    }[] = data.map((competiton: Competiton) =>
        competiton.races.map(race =>
        ({
            params: {
                competition: competiton.name,
            }
        })))
        .flat()
    return {
        paths: pathsWithParams,
        fallback: true
    }
}

export const getStaticProps: GetStaticProps = async (context) => {
    const data: Competiton[] = await getCompetitions();

    const competition = context.params?.competition

    const competitionData = data.find(competitionFrmList => competitionFrmList.name === competition)
    return {
        props: {
            competitions: data,
            competition: competition,
            competitionData: competitionData
        },
    }
}

interface CompetitionPageProps {
    competitions: Competiton[]
    competition: string,
    competitionData?: Competiton
}



export default function CompetitonPage(prop: CompetitionPageProps) {
    const { classes } = useStyles();

    return (
        <>
            <PreConfiguredHeadermenue competitions={prop.competitions} />
            <Container my="md">
                <Title order={1} gradient={{ from: 'cyan', to: 'indigo' }} color={"blue.9"}>{prop.competition}</Title>
                <Stack spacing={2} justify="flex-start" className={classes.padding}>
                    {prop.competitionData?.place ? <InfoText text={prop.competitionData?.place} icon={<IconMapPin size={16} />}/> : null}
                    {prop.competitionData?.dates ? <InfoText text={prop.competitionData?.dates} icon={<IconCalendarEvent size={16} />}/> : null}
                    {prop.competitionData?.info ? <InfoText text={prop.competitionData?.info} icon={ <IconInfoCircle size={16} />}/> : null}
                </Stack>
                {prop.competitionData ? getRacesBloks({ races: prop.competitionData.races, competitonName: prop.competition }) : <p>fel</p>}
            </Container>
        </>

    )
}