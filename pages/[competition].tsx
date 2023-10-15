import {GetStaticProps, GetStaticPaths} from 'next';
import {Container, createStyles, Stack, Title, Loader, Collapse, Button, Card, Space} from '@mantine/core';
import {Competiton, LiveData, Metadata} from '../components/entities';
import {getRacesBloks} from '../components/races';
import {PreConfiguredHeadermenue} from '../components/PreConfiguredHeadermenue';
import {getCompetitions, getLiveCompetition} from '../components/helerFile';
import {IconMapPin, IconCalendarEvent, IconInfoCircle} from '@tabler/icons-react';
import {InfoText} from '../components/InfoText';
import React, {useEffect, useState} from "react";
import CompeitionProgram from "../components/CompeitionProgram";



const useStyles = createStyles((theme) => ({
    padding: {
        paddingTop: 10,
        paddingBottom: 20
    }
}))

export const getStaticPaths: GetStaticPaths = async () => {
    const data = await getCompetitions()
    const liveCompetition = await getLiveCompetition()

    const pathsWithParams: {
        params: {
            competition: string;
        };
    }[] = data.map((competiton: Competiton) => ({params: {competition: competiton.name}}))

    if(liveCompetition.livedataActive)
        pathsWithParams.push({params: {competition: liveCompetition.liveData.name}})

    return {
        paths: pathsWithParams,
        fallback: false
    }
}
export const getStaticProps: GetStaticProps = async (context) => {
    const data: Competiton[] = await getCompetitions();
    const liveCompetition:Metadata = await getLiveCompetition()
    const competition = context.params?.competition

    console.log(liveCompetition)
    console.log(competition)
    if (liveCompetition.livedataActive) { //this is a live competition
        return {
            props: {
                live: true,
                liveCompetition: liveCompetition.liveData,
                competitions: data,
                competition: competition,
                competitionData: liveCompetition.liveData
            },
        }
    }

    const competitionData = data.find(competitionFrmList => competitionFrmList.name === competition)
    return {
        props: {
            live: false,
            liveCompetition: {},
            competitions: data,
            competition: competition,
            competitionData: competitionData
        },
    }
}

interface CompetitionPageProps {
    live: boolean,
    liveCompetition: LiveData | undefined,
    competitions: Competiton[]
    competition: string,
    competitionData?: Competiton
}


export default function CompetitionPage(prop: CompetitionPageProps) {
    const {classes} = useStyles();
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        if (prop.live && prop.liveCompetition) {
            fetch(prop.liveCompetition.url)
                .then(result => result.json())
                .then(result => result.data)
                .then((data) => {
                    const competition: Competiton = {
                        name: prop.liveCompetition?.name ?? "ERROR",
                        info: prop.liveCompetition?.info ?? "ERROR",
                        place: prop.liveCompetition?.place ?? "ERROR",
                        dates: prop.liveCompetition?.dates ?? "ERROR",
                        races: data
                    }
                    setCompetitionData(competition)
                })
                .then(() => {
                    if(window.location.hash && !scrolled) {
                        var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
                        scrollToRace(hash)
                        setScrolled(true)
                        // hash found
                    } else {
                        // No hash found
                    }
                })
        } else {
            setCompetitionData(prop.competitionData)
        }

    }, [prop.liveCompetition, prop.competitionData, prop.live, scrolled])

    const [competitionData, setCompetitionData] = useState<Competiton | undefined>(undefined);
    const [open, setOpen] = useState<boolean>(false);

    function scrollToRace(race:string) {
        const element = document.querySelector('#race'+race)
        if(!element) return
        const topPos = element.getBoundingClientRect().top + window.pageYOffset

        window.scrollTo({
            top: topPos, // scroll so that the element is at the top of the view
            behavior: 'smooth' // smooth scroll
        })
    }

    return (
        <>
            <PreConfiguredHeadermenue competitions={prop.competitions} liveCompetition={prop.live && prop.liveCompetition ? [prop.liveCompetition.name] : []}/>
            <Container my="md">
                <Title order={1} gradient={{from: 'cyan', to: 'indigo'}} color={"blue.9"}>{prop.competition}</Title>
                <Stack spacing={2} justify="flex-start" className={classes.padding}>
                    {prop.competitionData?.place ?
                        <> <InfoText
                            text={competitionData?.place ?? "ERROR"}
                            icon={<IconMapPin size={16}/>}
                            loading={competitionData?.place == undefined}
                            loadingProcent={20}/> </>
                        : null}

                    {prop.competitionData?.dates ?
                        <> <InfoText
                            text={competitionData?.dates ?? "ERROR"}
                            icon={<IconCalendarEvent size={16}/>}
                            loading={competitionData?.dates == undefined}
                            loadingProcent={40}/> </>
                        : null}
                    {prop.competitionData?.info ?
                        <> <InfoText
                            text={competitionData?.info ?? "ERROR"}
                            icon={<IconInfoCircle size={16}/>}
                            loading={competitionData?.info == undefined}
                            loadingProcent={30}/> </>
                        : null}

                    <Space h="xs" />
                    <Button fullWidth  variant={"default"} onClick={() => setOpen(!open)} >{ open? "Stäng program" : "Visa program"}</Button>
                    <Space h="xs" />
                    <Collapse in={open} >
                        <Card withBorder radius="md" p="xl" className={classes.padding}>
                            <CompeitionProgram competition={competitionData} loading={competitionData == undefined} clickType={prop.live ? "toRaceBlock" : "toRacePage"}/>
                        </Card>
                    </Collapse>
                </Stack>
                {
                    competitionData == undefined ? <Loader size="xl" variant="dots"/> :
                        prop.competitionData ? getRacesBloks({
                            races: competitionData?.races || [],
                            competitionName: prop.competition,
                            liveCompetition: prop.live
                        }) : <p>fel</p>
                }
            </Container>
        </>

    )
}