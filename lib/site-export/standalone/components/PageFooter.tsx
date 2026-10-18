import { readSite } from "../lib/site";

export default function PageFooter() {
  const footer = readSite().pageFooter;
  if (!footer) return null;
  if (footer.variant === "links") {
    if (!footer.links.length) return null;
    return <footer className="generic-footer">{footer.links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</footer>;
  }
  return <footer className="page-footer"><div className="page-footer-grid"><div><a className="page-footer-brand" href="/">Cash<span>Path</span></a><p>{footer.statement}</p></div>{footer.columns.map((column) => <div key={column.title}><b>{column.title}</b><div className="links">{column.links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</div></div>)}</div></footer>;
}
