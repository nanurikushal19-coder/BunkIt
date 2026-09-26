function openFiles(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("bunkit.files", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("materials");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function saveFile(id: string, file: File) {
  const db = await openFiles();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("materials", "readwrite");
    tx.objectStore("materials").put(file, id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
export async function downloadFile(id: string, name: string) {
  const db = await openFiles();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("materials", "readonly");
    const request = tx.objectStore("materials").get(id);
    request.onsuccess = () => {
      db.close();
      if (!request.result) {
        reject(
          new Error("This file is missing from this browser. Upload it again."),
        );
        return;
      }
      const url = URL.createObjectURL(request.result);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      resolve();
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}
export async function deleteFile(id: string) {
  const db = await openFiles();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("materials", "readwrite");
    tx.objectStore("materials").delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
