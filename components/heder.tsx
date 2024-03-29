import {
  createStyles,
  Header,
  Menu,
  Group,
  Center,
  Burger,
  Container,
  Image,
} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {IconChevronDown} from '@tabler/icons-react';
import Link from 'next/link';
import Pulsing from "./pulsing/Pulsing";
import {useState} from "react";

import drakbonLoggaAndText from "../public/images/drakbonLoggaAndText.webp"

const useStyles = createStyles((theme) => ({
  inner: {
    height: 56,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  backround: {
    // backgroundColor: "#0014c9",
    backgroundColor: "blue.8",
    height: "fit"
  },

  linkLabel: {
    marginRight: 50,
  },
}));

interface HeaderSearchProps {
  liveCompetitions: string[];
  links: { label: string; links: { label: string, onPress: (comp: string) => void }[] }[];
}

export function HeaderMenu({ links, liveCompetitions }: HeaderSearchProps) {
  const [opened, setOpened] = useState(false);
  const { classes } = useStyles();
  const smallScreen = useMediaQuery('(min-width: 56.25em)');

  const items = links.map((link) => {
    const regularCompetitionMenuItems = link.links?.map((item) => (
      <Menu.Item key={item.label} onClick={() => { item.onPress(item.label) }}>{item.label}</Menu.Item>
    ))

    const liceCompetitionMenuItems = liveCompetitions?.map((liveCompetition) => (
        <Menu.Item
            key={liveCompetition}
            component="a"
            href={'/' + liveCompetition}
        >
          <Group  spacing="xs"  className={classes.backround} >
              <Pulsing/> {"LIVE - " + liveCompetition}
          </Group>
        </Menu.Item>
    ))

    if (regularCompetitionMenuItems) {
      return (
        <Menu key={link.label} onOpen={() => setOpened(true)} onClose={() => setOpened(false)} transitionProps={{exitDuration:0}} >
          <Menu.Target>
            {smallScreen ?
                <div className={classes.links}>
                  <a
                      className={classes.link}
                      onClick={(event) => event.preventDefault()}
                  >
                    <Center>
                      <span className={classes.linkLabel}>{link.label}</span>
                      <IconChevronDown size="1rem" stroke={1.5}/>
                    </Center>
                  </a>
                </div>
                :
                <div className={classes.burger}>
                  <Center>
                    <Burger opened={opened} size="sm"/>
                  </Center>
                </div>
            }
          </Menu.Target>
          <Menu.Dropdown>{liceCompetitionMenuItems.concat(regularCompetitionMenuItems)}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <a
        key={link.label}
        href={link.label}
        className={classes.link}
        onClick={(event) => event.preventDefault()}
      >
        {link.label}
      </a>
    );
  });

  return (
    <Header height={56} mb={12} >
      <Container>
        <div className={classes.inner}>
          <Group>
            <Link href={"/"}>
              <Image height={56 * 0.7} className={classes.backround} src={drakbonLoggaAndText.src} alt={"Logo of the page"}/>
            </Link>
          </Group>
          <Group spacing={5} >
            {items}
          </Group>
        </div>
      </Container>
    </Header>
  );
}