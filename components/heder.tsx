import { createStyles, Header, Avatar, Menu, Group, Center, Burger, Container, Image } from '@mantine/core';
import { useDisclosure, useElementSize } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons';
import { MantineLogo } from '@mantine/ds';
import { randomBytes } from 'crypto';
import { useState } from 'react';
import Link from 'next/link';

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
  links: { label: string; links: { label: string, onPress: (comp: string) => void }[] }[];
}

export function HeaderMenu({ links }: HeaderSearchProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const { classes } = useStyles();

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.label} onClick={() => { item.onPress(item.label) }}>{item.label}</Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu key={link.label} trigger="hover" exitTransitionDuration={0} >
          <Menu.Target>
            <a
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size={12} stroke={1.5} />
              </Center>
            </a>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
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
              <Image height={56 * 0.7} className={classes.backround} src={"/images/drakbonLoggaAndText.webp"} />
            </Link>
          </Group>
          <Group spacing={5} className={classes.links}>
            {items}
          </Group>
          <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />
        </div>
      </Container>
    </Header>
  );
}