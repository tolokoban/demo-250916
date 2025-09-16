import { useGameHandler } from "./_/game"
import styles from "./page.module.css"

export default function Page() {
    const handleGame = useGameHandler()
    return (
        <div className={styles.main}>
            <canvas ref={handleGame}></canvas>
        </div>
    )
}
