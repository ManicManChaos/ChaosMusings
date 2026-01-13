'use client';
export default function SigilNav({active,onChange}){return <aside>{['today','year','roid','moments','settings'].map(k=><button key={k} onClick={()=>onChange(k)}>{k}</button>)}</aside>}