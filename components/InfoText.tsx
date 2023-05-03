
import { Title, createStyles, Table, Progress, Anchor, Text, Group, ScrollArea, Container, Avatar, BadgeStylesNames, Card, Grid, ActionIcon } from '@mantine/core';
import { Race } from './entities';
import getRaceBlock from './raceBlock';
import { IconSettings, IconMapPin, IconCalendarEvent, IconInfoCircle,TablerIcon } from '@tabler/icons';

interface InfoTextProps {
  text:string,
  icon?: React.ReactElement,
}

export function InfoText(prop: InfoTextProps) {

  return (

    <Grid justify="flex-end">
      <Grid.Col span="content">
        <ActionIcon color="blue.8" size="sm" variant="transparent">
          {prop.icon}
          {/* <IconMapPin size={16} /> */}
        </ActionIcon>
      </Grid.Col>
      <Grid.Col span={"auto"}>
        <Text > {prop.text}</Text>
      </Grid.Col>
    </Grid>

  );
}
