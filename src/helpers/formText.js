
export default function formText(text = '', max = 35) {
    if (!text) return [];
    const chunks = [];
    for (let i = 0; i < text.length; i += max) {
        chunks.push(text.substring(i, i + max));
    }
    return chunks;
}


