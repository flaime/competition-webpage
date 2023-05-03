
import styles from "./Pulsing.module.css"

interface PulsingProps {
  // race: Race,
  // competitionName: string
}

export default function Pulsing(props: PulsingProps) {
  return (
    <div className={styles.blob}/>
  );
}
