//frontend/src/app/pages/recept.tsx

import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  PromiseLikeOfReactNode,
} from "react";

export async function getServerSideProps(context: any) {
  // Notera: Använd inte localhost i produktion, utan miljövariabel för din server URL
  const res = await fetch(`${process.env.BACKEND_URL}/recipes`);
  const data = await res.json();

  return {
    props: {
      recept: data,
    },
  };
}

function ReceptPage({ recept }) {
  return (
    <div>
      <h1>Recept</h1>
      {/* Rendera dina recept här */}
      {recept.map(
        (r: {
          _id: Key | null | undefined;
          name:
            | string
            | number
            | boolean
            | ReactElement<any, string | JSXElementConstructor<any>>
            | Iterable<ReactNode>
            | ReactPortal
            | PromiseLikeOfReactNode
            | null
            | undefined;
        }) => (
          <div key={r._id}>
            <h2>{r.name}</h2>
            {/* Använd andra fält från ditt receptobjekt här */}
          </div>
        )
      )}
    </div>
  );
}

export default ReceptPage;
