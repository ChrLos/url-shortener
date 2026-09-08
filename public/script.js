document.getElementById('reset-data').addEventListener('click', async () => {
    const res = await fetch('/resetDatabase', { method: 'POST' })

    if (res.ok) {
        console.log("Database deleted")
    }

    location.href = '/';
})