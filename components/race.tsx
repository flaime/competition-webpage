
import { createStyles, Table, Progress, Anchor, Text, Group, ScrollArea, Container, Avatar, BadgeStylesNames } from '@mantine/core';
import { Race } from './entities';


function getClubLoggo(clubbName: string): string | undefined {

    if (clubbName === "Tibro")
      return "/images/tibroLoggo.jpeg"
    else if (clubbName === "Örnsberg")
      return "/images/ÖrnsbergLoggo.jpeg"
    else if (clubbName === "Stokholm")
      return "/images/SPKLoggo.gif"
    else
      return undefined
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

  /*const rows = data.map((row) => {
    const totalReviews = row.reviews.negative + row.reviews.positive;
    const positiveReviews = (row.reviews.positive / totalReviews) * 100;
    const negativeReviews = (row.reviews.negative / totalReviews) * 100;

    return (
      <tr key={row.title}>
        <td>
          <Anchor<'a'> size="sm" onClick={(event) => event.preventDefault()}>
            {row.title}
          </Anchor>
        </td>
        <td>{row.year}</td>
        <td>
          <Anchor<'a'> size="sm" onClick={(event) => event.preventDefault()}>
            {row.author}
          </Anchor>
        </td>
        <td>{Intl.NumberFormat().format(totalReviews)}</td>
        <td>
          <Group position="apart">
            <Text size="xs" color="teal" weight={700}>
              {positiveReviews.toFixed(0)}%
            </Text>
            <Text size="xs" color="red" weight={700}>
              {negativeReviews.toFixed(0)}%
            </Text>
          </Group>
          <Progress
            classNames={{ bar: classes.progressBar }}
            sections={[
              {
                value: positiveReviews,
                color: theme.colorScheme === 'dark' ? theme.colors.teal[9] : theme.colors.teal[6],
              },
              {
                value: negativeReviews,
                color: theme.colorScheme === 'dark' ? theme.colors.red[9] : theme.colors.red[6],
              },
            ]}
          />
        </td>
      </tr>
    );
  });*/

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
