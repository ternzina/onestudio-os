#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const [input, output = "docs/cashpath/guides"] = process.argv.slice(2);
if (!input) throw new Error("Usage: import-cashpath-bulk-corpus <corpus-dir> [output-dir]");
const rejected = new Set(["2026-09-10-personal-loan-for-medical-bills.md","2026-09-10-personal-loan-prequalification-vs-preapproval.md","2026-09-10-personal-loan-request-vs-application-vs-approval.md","2026-09-10-personal-loan-vs-credit-card-cash-advance.md","2026-09-10-secured-vs-unsecured-personal-loan.md","2026-09-10-cosigner-vs-co-borrower-on-a-personal-loan.md","2026-09-10-someone-opened-a-loan-in-my-name.md","2026-09-10-personal-loan-vs-irs-payment-plan.md","2026-09-10-personal-loan-vs-line-of-credit.md"]);
const existing = new Set(fs.readdirSync(output).filter(f=>f.endsWith(".md")).map(f=>fs.readFileSync(path.join(output,f),"utf8").match(/^slug:\s*(.+)$/m)?.[1]).filter(Boolean));
const category = s => /scam|identity|collector|garnishment|time-barred|military|agreement|cancel|live-check/.test(s)?"Rights & Safety":/credit|approval|denied|requirements|income|job|bankruptcy|prequalification|utilization|credit-report|debt-to-income/.test(s)?"Credit & Approval":/debt|payoff|payment|refinance|hardship|charge-off/.test(s)?"Debt & Repayment":/medical|rent|utility|funeral|adoption|child|ivf|immigration|legal|wedding|vacation|vet/.test(s)?"Life & Emergency Expenses":/car|auto|home|appliance|solar|hvac|ev|lease|down-payment/.test(s)?"Home, Auto & Major Purchases":/vs-|compare|lender|line-of-credit|bnpl|payday|pawnshop|title-loan|balance-transfer|business-loan/.test(s)?"Compare Borrowing Options":"Loan Basics";
const field=(s,n)=>s.match(new RegExp(`^\\*\\*${n}:\\*\\*\\s*(.+)$`,"mi"))?.[1].trim().replace(/^`|`$/g,"");
const normalize=s=>s.split(/\r?\n/).filter(l=>!/^\*\*(Status|QA score|Reviewed|Target query|Search intent|SEO title|Meta description|Slug|H1):\*\*/i.test(l)&&l.trim()!=="---").map(l=>/^#{3,}\s+/.test(l)?`## ${l.replace(/^#+\s+/,"")}`:/^>\s?/.test(l)?l.replace(/^>\s?/,""):/^\|.*\|\s*$/.test(l)?l.replace(/^\||\|$/g,"").split("|").map(x=>x.trim()).filter(x=>x&&!/^:?-{3,}:?$/.test(x)).join(" — "):l.replace(/`([^`]+)`/g,"$1").replace(/^\s{2,}[-+*]\s+/,"- ")).join("\n").replace(/\n{3,}/g,"\n\n").trim();
let added=0;
for(const file of fs.readdirSync(input).filter(f=>f.endsWith(".md")).sort()){
  if(rejected.has(file))continue; const raw=fs.readFileSync(path.join(input,file),"utf8"); const slug=(field(raw,"Slug")?.replace(/^\/p\//,"")||raw.match(/^slug:\s*(.+)$/m)?.[1]);
  if(!slug||existing.has(slug))continue; const title=raw.match(/^#\s+(.+)$/m)?.[1]||field(raw,"H1"); let body=normalize(raw.replace(/^---[\s\S]*?---\s*/,"")); if(!body.startsWith("# "))body=`# ${title}\n\n${body}`; if(!/^##\s/m.test(body))body+="\n\n## Overview\n\nGeneral educational information.\n";
  const esc=x=>(x||"").replaceAll('"','\\"'); const front=`---\nslug: ${slug}\norder: 9999\nnav_label: ${title.slice(0,52)}\neyebrow: PERSONAL LOAN GUIDE\ncategory: ${category(slug)}\nseo_title: "${esc(field(raw,"SEO title")||`${title} | CashPath`)}"\nseo_description: "${esc(field(raw,"Meta description")||`${title} — educational information from CashPath.`)}"\n---\n\n`;
  fs.writeFileSync(path.join(output,`${slug}.md`),front+body+"\n"); added++;
}
const all=fs.readdirSync(output).filter(f=>f.endsWith(".md")).sort((a,b)=>{const aa=fs.readFileSync(path.join(output,a),"utf8").match(/^slug:\s*(.+)$/m)?.[1]||a;const bb=fs.readFileSync(path.join(output,b),"utf8").match(/^slug:\s*(.+)$/m)?.[1]||b;return aa.localeCompare(bb)});
all.forEach((file,index)=>{const p=path.join(output,file);let source=fs.readFileSync(p,"utf8");const slug=source.match(/^slug:\s*(.+)$/m)?.[1];source=source.replace(/^order:\s*.*$/m,`order: ${index+1}`);if(!/^category:/m.test(source))source=source.replace(/^eyebrow:.*$/m,m=>`${m}\ncategory: ${category(slug)}`);fs.writeFileSync(p,source)});
console.log(`Imported ${added} unique corpus guides.`);
