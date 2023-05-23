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

export const formatTime = (time) => {
    const hours = Math.floor(time / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};  
 
