
import {
    Text,
    Grid,
    ActionIcon,
    Skeleton
} from '@mantine/core';

interface InfoTextProps {
  text:string,
  icon?: React.ReactElement,
  loading: boolean,
  loadingProcent:number
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
          {
              prop.loading ?
                  <Text>  <Skeleton height={8} mt={6} radius="xl" width={ prop.loadingProcent + "%"}/> </Text> :
                  <Text>  { prop.text } </Text>
          }
      </Grid.Col>
    </Grid>

  );
}
