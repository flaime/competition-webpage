
import { Table, Text, Group, ScrollArea, Container, Avatar } from '@mantine/core';
import { Race } from './entities';

import spk from "../public/images/SPKLoggo.gif"
import huskvarna from "../public/images/HuskvarnaLogga.webp"
import malmo from "../public/images/MalmöLogga.png"
import tibro from "../public/images/tibroLoggo.jpeg"
import kungalv from "../public/images/kungälvLogga.png"
import ornsberg from "../public/images/ÖrnsbergLoggo.jpeg"


function getClubLoggo(clubbName: string): string | undefined {
    const cleanClubName = clubbName
        .replace(" ", "")
        .replace("1","")
        .replace("2", "")
        .replace("3", "")
        .replace("4", "")
        .replace("5", "")
        .replace("6", "")
        .replace("7", "")
        .replace("8", "")
        .replace("9", "")

    switch (cleanClubName) {
        case "Stokholm":
        case "SPK":
            return spk.src
        case "Huskvarna":
            return huskvarna.src
        case "Malmö":
            return malmo.src
        case 'Tibro':
            return tibro.src
        case 'Kungälv':
            return kungalv.src
        case 'Örnsberg':
        case 'ÖKS':
            return ornsberg.src
        default:
            return undefined
    }
}

export default function getRace(race:Race) {
  //export function TableReviews({ data }: TableReviewsProps) {
//  const { classes, theme } = useStyles();

  var banorOrderd = race.banor
  if (race.banor.length > 0)
    if (banorOrderd[0].tid === "")
      banorOrderd = race.banor.sort((a, b) => (a.bana as number) - (b.bana as number))
    else
      banorOrderd = race.banor.sort((a, b) => (a.placering as number) - (b.placering as number))


  const rows = banorOrderd.map(bana => {
    return <tr key={bana?.namn ?? "unkonwbana"  + race.loppnummer}>
      <td>{bana.bana}</td>

      <td>
        <Group spacing="sm">
          <Avatar size={26} src={getClubLoggo(bana.namn ?? "")} radius={26} />
          <Text size="sm" weight={500}>
            {bana.namn}
          </Text>
        </Group>
      </td>
      <td>{bana.tid}</td>
      <td>{bana.placering}</td>
    </tr>
  })

  return (
    <Container size="lg" py="xl">
      <ScrollArea>
        <Table verticalSpacing="xs" >
          <thead>
            <tr>
              <th>Bana</th>
              <th>Klubb</th>
              <th>Tid</th>
              <th>Placering</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </ScrollArea>
    </Container>
  );
}
