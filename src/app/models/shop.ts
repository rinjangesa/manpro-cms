export interface Character {
    id?: string;
    name?: string;
    japanname?: string;
    price?: number;
    exp?: number;
    money?: number;
    descriptionID?: string;
    descriptionEN?: string;
    descriptionJP?: string;
    oriimg?: string;
    fullimg?: string;
    thumbimg?: string;
    createdAt?: Date;
}

export interface Wallpaper {
    id?: string;
    name?: string;
    japanname?: string;
    price?: number;
    fullimg?: string;
    thumbimg?: string;
    createdAt?: Date;
}

export interface Decoration {
    id?: string;
    name?: string;
    japanname?: string;
    price?: number;
    fullimg?: string;
    thumbimg?: string;
    createdAt?: Date;
}
