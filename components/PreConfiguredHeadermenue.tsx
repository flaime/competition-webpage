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
}

const useStyles = createStyles((theme) => ({

}))

export function PreConfiguredHeadermenue({ competitions }: HeaderSearchProps) {
    const { classes } = useStyles();
    const router = useRouter();

    return (
        <HeaderMenu links={
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
