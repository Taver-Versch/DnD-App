import styles from './WikiLink.module.css'

/** Small "look it up" link out to the reference wiki - opens in a new tab. */
export function WikiLink({ href, title = 'Look up on the wiki' }: { href: string; title?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link} title={title}>
      🔗
    </a>
  )
}
