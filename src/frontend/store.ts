import { MemoryStorage, setActiveStorage } from "@kinde-oss/kinde-auth-react/utils";

export const clientStorage = new MemoryStorage();
setActiveStorage(clientStorage);
