const generateSearchKeywords = (title, author_fn, author_ln) => {
    const keywords = [];
    // Add title keywords
    keywords.push(...title.toLowerCase().split(" "));
    // Add author's first name keywords
    keywords.push(...author_fn.toLowerCase().split(" "));
    // Add author's last name keywords
    keywords.push(...author_ln.toLowerCase().split(" "));
    return keywords;
};

export default generateSearchKeywords;