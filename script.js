fetch("https://kaamnearby.onrender.com/api/test")
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
    })
    .catch(error => {
        console.log("Backend connection failed:", error);
    });
