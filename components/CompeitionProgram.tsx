
import { createStyles, Table, Skeleton } from '@mantine/core';
import { useRouter } from 'next/router';
import { Competiton, } from './entities';
import { useEffect, useState } from 'react';

interface LiveIndexPageBlockProps {
  competition?: Competiton,
  clickable?: boolean,
  loading: boolean
}

const useStyles = createStyles((theme) => ({
  onHover: {
    cursor: "pointer",
    backgroundColor: '#fff',
    '&:hover': {
      backgroundColor: '#f1f3f5',
    },
  }
}))

function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function LiveIndexPageBlock({ competition, clickable, loading }: LiveIndexPageBlockProps) {
  const router = useRouter();
  const { classes } = useStyles();

  const rows = competition?.races.map((race, index) => (

    <tr key={race.loppnummer + (race.loppInfo ?? "") + race.loppTid + index} className={(clickable && race.banor.length > 0)? classes.onHover : undefined} onClick={() => {(clickable && race.banor.length > 0) ? router.push("/" + competition?.name + "/" + race.loppnummer) : null }}>
      <td>{race.loppnummer}</td>
      <td>{race.loppInfo}</td>
      <td>{race.loppTid}</td>
    </tr >
  ));

  const [loadRows, setLoadRows] = useState<Array<JSX.Element>>([
    <tr key={0} >
      <td colSpan={3}><Skeleton height={8} mt={6} radius="xl" width={"70%"} /></td>
    </tr>
  ])


  useEffect(() => {
    var counter = 0;
    const myInterval = setInterval(() => {
      counter = counter + 1
      setLoadRows((prevLoadRows) => [...prevLoadRows,
      <tr key={prevLoadRows.length} >
        <td colSpan={3}><Skeleton height={8} mt={6} radius="xl" width={randomNumber(20, 90).toString() + "%"} /></td>
      </tr>
      ])
      if (counter > 20) { //max 20 elements in the list before stop
        clearInterval(myInterval)
      }
    }, 300);
    // clear out the interval using the id when unmounting the component
    return () => clearInterval(myInterval);
  }, []);

  return (
        <Table>
          <thead>
            <tr>
              <th>Nr</th>
              <th>Lopp</th>
              <th>Tid</th>
            </tr>
          </thead>

          {loading ?
            <tbody>{loadRows}</tbody>
            :
            <tbody>{rows}</tbody>
          }
        </Table>
  );
}