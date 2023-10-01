import {
    Grid
} from '@mantine/core';
import { Race} from './entities';
import getRaceBlock from './raceBlock';


interface RaceBloksProps {
    races: Race[],
    competitionName: string,
    liveCompetition?: boolean
}

export function getRacesBloks(props: RaceBloksProps) {

    return (
        <Grid>
            {
                props.races.filter(race => {
                        if (race.info == true || (typeof race.loppnummer === "string" && race.banor.length == 0))
                            return false
                        else
                            return true
                    }
                ).map(race =>
                    <Grid.Col key={race.loppInfo + race.loppnummer.toString() + race.loppTid + Math.random()} xs={4}
                              color={"blue.8"}>
                        {getRaceBlock({race: race, competitionName: props.competitionName, liveRace: props.liveCompetition})}
                    </Grid.Col>)
            }
        </Grid>
    );
}
