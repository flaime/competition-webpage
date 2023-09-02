export interface Competiton {
    name: string,
    info: string | null,
    place: string | null,
    dates: string | null,
    races: Race[]
}

export interface Race {

    loppnummer: number,
    loppTid?: string,
    loppInfo?: string,
    info?: boolean;
    banor: Bana[],
}

export interface Bana {
    bana?: string | number;
    namn?: string;
    tid?: string;
    placering?: string | number
}

export interface File {
    filename: string,
    competition: Competiton

}

export interface LiveData {
    url: string;
    info: string;
    name: string;
    dates: string;
    place: string;
}

export interface Metadata {
    livedataActive: boolean;
    liveData: LiveData;
}