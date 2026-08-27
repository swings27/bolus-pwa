// Sur Safari iOS, IndexedDB peut être effacé après sept jours sans
// interaction avec le site si le stockage n'est pas passé en mode
// "persistant" — un risque réel pour une bêta consultée irrégulièrement :
// le catalogue de fiches disparaîtrait silencieusement au prochain lancement.
//
// Le navigateur décide seul d'accorder cette demande, selon ses propres
// critères (installation sur l'écran d'accueil, fréquence de visite, mise
// en favori...) : impossible de la forcer, seulement de la solliciter — une
// raison de plus de pousser l'installation via InstallBanner.
export async function demanderPersistance(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  const dejaPersistant = await navigator.storage.persisted()
  if (dejaPersistant) return true
  return await navigator.storage.persist()
}
