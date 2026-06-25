import type { GetServerSideProps } from "next";

type Props = {
  serverMessage: string;
  renderedAt: string;
};

export default function SSRTestPage({ serverMessage, renderedAt }: Props) {
  return (
    <div>
      <h1>Pages Router SSR Test</h1>
      <p data-testid="server-message">{serverMessage}</p>
      <p data-testid="rendered-at">Rendered at: {renderedAt}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      serverMessage: "This content was server-rendered",
      renderedAt: "today",
    },
  };
};
