import { createStyles } from '@mantine/core';
import { NextRouter, useRouter } from 'next/router';
import { Competiton } from './entities';
import { HeaderMenu } from './heder';

const SetUrl = (competition: string, router: NextRouter) => {
    router.push({
        pathname: '/' + competition
    })
}

interface HeaderSearchProps {
    competitions: Competiton[];
    liveCompetition: string[];
}

const useStyles = createStyles((theme) => ({

}))

export function PreConfiguredHeadermenue({ competitions, liveCompetition }: HeaderSearchProps) {
    const { classes } = useStyles();
    const router = useRouter();


    return (
        <HeaderMenu liveCompetitions={liveCompetition} links={
            [{
                label: "Tävlingar",
                links: competitions.map(competition => {
                    return {
                        label: competition.name,
                        onPress: (competitionPresed: string) => {
                            SetUrl(competition.name, router)
                        }
                    }
                })
            }]} />
    );
}
