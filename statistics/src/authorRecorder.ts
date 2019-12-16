export class AuthorRecorder {
    private frequency: Map<string, number>;
    private delegation: Map<string, number>;

    public constructor() {
        this.frequency = new Map();
        this.delegation = new Map();
    }

    public recordAuthor(author: string) {
        const prevVal = this.frequency.get(author);
        this.frequency.set(author, prevVal ? prevVal + 1 : 1);
    }

    /// This function assumes constant voting power within the recording range
    public recordDelegation(author: string, delegation: number) {
        this.delegation.set(author, delegation);
    }

    public getAuthorList(): IterableIterator<string> {
        return this.frequency.keys();
    }

    public totalCount(): number {
        let accumulator = 0;
        this.frequency.forEach((frequency, _author) => {
            accumulator += frequency;
        });
        return accumulator;
    }

    public toJSON() {
        const exportMap: Map<
            string,
            { authorCount: number; delegation: number }
        > = new Map();
        this.frequency.forEach((frequency, author) => {
            const delegation = this.delegation.get(author)!;
            exportMap.set(author, {
                authorCount: frequency,
                delegation: delegation
            });
        });
        return Array.from(exportMap.entries());
    }
}
