export interface Kanji {
    id?: string;
    grade?: string;
    kanji?: string;
    onyomi?: string;
    kunyomi?: string;
    indonesia?: string;
    english?: string;
    stroke?: string;
    example?: string;
    animation?: string;
    zJson?: string;
}

export interface KanjiQuiz {
    id?: string;
    kanji?: string;
    grade?: string;
    type?: string;
    question?: string;
    answer?: string;
    option1?: string;
    option2?: string;
    option3?: string;
    correction?: string;
}

export interface PhraseCategory {
    id?: string;
    japan?: string;
    indonesia?: string;
    english?: string;
    romaji?: string;
    img?: string;
}

export interface Phrase {
    id?: string;
    category?: string;
    japan?: string;
    indonesia?: string;
    english?: string;
    romaji?: string;
    description?: string;
}

export interface PhraseQuiz {
    id?: string;
    category?: string;
    question?: string;
    answer?: string;
    option1?: string;
    option2?: string;
    option3?: string;
    type?: string;
    correction?: string;
}

export interface Grammar {
    id?: string;
    tier?: string;
    title?: string;
    description?: string;
}

export interface GrammarQuiz {
    id?: string;
    tier?: string;
    question?: string;
    answer?: string;
    option1?: string;
    option2?: string;
    option3?: string;
    type?: string;
    correction?: string;
}
