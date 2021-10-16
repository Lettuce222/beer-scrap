import { FC, useEffect, useState } from 'react';
import { firebaseApp } from '../config/firebase';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import {
  getStorage,
  ref,
  getDownloadURL,
  FirebaseStorage,
} from 'firebase/storage';

type Props = {};

type Label = {
  title: string;
  url: string;
};

export const Scrap: FC<Props> = () => {
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);
  const [labels, setLabels] = useState<Label[]>([]);
  useEffect(() => {
    (async () => {
      const labelsCollection = collection(db, 'labels');
      const labelsSnapshot = await getDocs(labelsCollection);
      setLabels(
        labelsSnapshot.docs.map((doc) => ({
          title: doc.data().title,
          url: doc.data().storagePath,
        }))
      );
    })();
  }, [db]);

  return (
    <>
      {labels.map((label: Label) => (
        <Label label={label} storage={storage} />
      ))}
    </>
  );
};

const Label: FC<{ label: Label; storage: FirebaseStorage }> = ({
  label: { title, url },
  storage,
}) => {
  const [label, setLabel] = useState<Label>({ title, url: '' });
  useEffect(() => {
    (async () => {
      setLabel({ ...label, url: await getDownloadURL(ref(storage, url)) });
    })();
  }, [url]);

  return <img src={label.url} alt={label.title} />;
};
