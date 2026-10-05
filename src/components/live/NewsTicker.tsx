import s from './NewsTicker.module.css';

type Props = {
  text: string;
  date?: string;
};

export function NewsTicker({ text, date }: Props) {
  return (
    <div className={`rn-view ${s.bar}`}>
      <span className={`rn-text ${s.label}`}>ÚLTIMA HORA</span>
      <span className={`rn-text rn-line-1 ${s.text}`}>{text}</span>
      {date ? <span className={`rn-text ${s.date}`}>{date}</span> : null}
    </div>
  );
}
