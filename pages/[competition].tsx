import {GetStaticProps, GetStaticPaths} from 'next';
import {Container, createStyles, Stack, Title, Loader, Collapse, Button, Card, Space} from '@mantine/core';
import {Competiton, LiveData} from '../components/entities';
import {getRacesBloks} from '../components/races';
import {PreConfiguredHeadermenue} from '../components/PreConfiguredHeadermenue';
import {getCompetitions, getLiveCompetition} from '../components/helerFile';
import {IconMapPin, IconCalendarEvent, IconInfoCircle} from '@tabler/icons-react';
import {InfoText} from '../components/InfoText';
import React, {useEffect, useState} from "react";
import LiveIndexPageBlock from "../components/CompeitionProgram";


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

    pathsWithParams.push({params: {competition: liveCompetition.name}})
    return {
        paths: pathsWithParams,
        fallback: false
    }
}
export const getStaticProps: GetStaticProps = async (context) => {
    const data: Competiton[] = await getCompetitions();
    const liveCompetition = await getLiveCompetition()
    const competition = context.params?.competition

    if (competition === liveCompetition.name) { //this is a live competition
        return {
            props: {
                live: true,
                liveCompetition: liveCompetition,
                competitions: data,
                competition: competition,
                competitionData: liveCompetition
            },
        }
    }


    const competitionData = data.find(competitionFrmList => competitionFrmList.name === "Drakbåts sm 2021")
    return {
        props: {
            live: false,
            liveCompetition: liveCompetition,
            competitions: data,
            competition: competition,
            competitionData: competitionData
        },
    }
}

interface CompetitionPageProps {
    live: boolean,
    liveCompetition?: LiveData,
    competitions: Competiton[]
    competition: string,
    competitionData?: Competiton
}


export default function CompetitionPage(prop: CompetitionPageProps) {
    const {classes} = useStyles();

    useEffect(() => {
        if (prop.live) { //TODO fix link
            fetch('https://script.googleusercontent.com/a/macros/drakbatslandslaget.se/echo?user_content_key=B-peA7m_xqByAjMqOTXGWdTkzjXQz9z94H6uTgohQZc3xGWcVtC4ss_6MTpr2Pl7GlKxVMNG1CpVn8pszRZLI8hAcLZSLRcSOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMi80zadyHLKC4XXoRycefbuMA4o5UrXTyMdGZwidgSKtLhyHCd5hHayAs0y1hvN1V1-q-NOqS9oO9Zw_XAR0GF_nfqYc9ipWGggkwgJY3sYuywEA2Y53QVU0iLPXWNWdlLTvVHa578XEDynFSDancgg&lib=MI1MflFJSMKI6lDfch9W3KJGS7CWxxh_e')
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
        } else {
            setCompetitionData(prop.competitionData)
        }

    }, [prop.liveCompetition, prop.competitionData, prop.live])

    const [competitionData, setCompetitionData] = useState<Competiton | undefined>(undefined);
    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            {/*<PreConfiguredHeadermenue competitions={competitions}      liveCompetition={liveData.name ? [liveData.name] : []} />*/}
            <PreConfiguredHeadermenue competitions={prop.competitions} liveCompetition={prop.liveCompetition ? [prop.liveCompetition?.name] : []}/>
            {prop.liveCompetition + "kalaskul"}
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
                            <LiveIndexPageBlock competition={competitionData} loading={competitionData == undefined} clickable={!prop.live}/>
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