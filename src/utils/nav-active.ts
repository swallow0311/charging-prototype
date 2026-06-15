/** 判断侧栏子菜单是否处于激活态 */
export function isNavItemActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href
  if (pathname === href) return true
  return pathname.startsWith(`${href}/`)
}
