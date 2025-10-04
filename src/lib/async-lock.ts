export class AsyncLock {
	private current: Promise<any> | null = null;

	async run<T>(fun: () => Promise<T>): Promise<T> {
		while (this.current) await this.current;

		const lock = (async () => {
			try {
				return await fun();
			} finally {
				this.current = null;
			}
		})();

		this.current = lock;
		return lock;
	}
}
