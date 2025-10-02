import { MemoryStorage, setActiveStorage } from "@kinde/js-utils";

export const clientStorage = new MemoryStorage();
setActiveStorage(clientStorage);
