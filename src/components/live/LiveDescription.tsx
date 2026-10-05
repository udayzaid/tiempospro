import s from './LiveDescription.module.css';

type Props = {
  title: string;
  body: string;
};

export function LiveDescription({ title, body }: Props) {
  return (
    <section className={`rn-view ${s.container}`} aria-label={title}>
      <h2 className={`rn-text ${s.title}`}>{title}</h2>
      <p className={`rn-text ${s.body}`}>{body}</p>
    </section>
  );
}
