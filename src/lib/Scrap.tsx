import { FC, useEffect, useState } from 'react';
import { firebaseApp } from '../config/firebase';
import {
  getFirestore,
  collection,
  getDocs,
  Firestore,
} from 'firebase/firestore/lite';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

type Props = {};

type Label = {
  title: string;
  url: string;
};

const getLabels = async (
  db: Firestore,
  getUrl: (storagePath: string) => Promise<string>
): Promise<Promise<Label>[]> => {
  const labelsCollection = collection(db, 'labels');
  const labelsSnapshot = await getDocs(labelsCollection);
  return labelsSnapshot.docs.map(async (doc) => ({
    title: doc.data().title,
    url: await getUrl(doc.data().storagePath),
  }));
};

export const Scrap: FC<Props> = () => {
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);
  const [labels, setLabels] = useState<Label[]>([]);
  useEffect(() => {
    (async () => {
      const tmpLabels: Label[] = [];
      (
        await getLabels(db, (storagePath: string) =>
          getDownloadURL(ref(storage, storagePath))
        )
      ).forEach(async (label) => {
        tmpLabels.push(await label);
      });
      setLabels(tmpLabels);
    })();
  }, [db, storage]);

  return (
    <>
      {labels.map((label: Label) => (
        <img src={label.url} alt={label.title} />
      ))}
    </>
  );
};
