require("dotenv").config();
const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const {trackProduct, getPrice} = require("./priceTracker/priceTraker");
const { default: mongoose } = require("mongoose");
const TrackingProducts = require("./database/TrackingProducts");
const sendEmail = require("./priceTracker/sendEmail");

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cors());
app.use(express.json());

app.get("/search", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Query is required" });

  console.log("Query:", query);

  try {
    const browser = await puppeteer.launch({
      headless: "new", // Ensures Puppeteer runs in headless mode
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(query)}`, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector(".s-card-container");
    await page.waitForSelector(".s-image", { visible: true });

    // Simulate scrolling to act like a real user
    await page.evaluate(() => window.scrollBy(0, 300));

    const products = await page.evaluate(() => {
      return [...document.querySelectorAll(".s-card-container")]
        .slice(2)
        .map((el) => {
          return {
            name: el.querySelector("h2 span")?.innerText || "No Name",
            price: el.querySelector(".a-price-whole")?.innerText || "No Price",
            image: el.querySelector(".s-image")?.getAttribute("srcset")?.split(" ")[0] || "",
            link: el.querySelector(".s-link-style")?.href || "#",
          };
        });
    });

    await browser.close();
    /*

    res.json({ products : [{
      name: "Dell 15 Thin & Light Laptop, Intel Core i5-1235U Processor/16GB DDR4 + 512GB SSD/Intel UHD Graphics/15.6\" (39.62cm) FHD Display/Win 11 + MSO'21/15 Month McAfee/Carbon Black/Spill Resistant KB/1.69kg",
      price: "50,990",
      image: "https://m.media-amazon.com/images/I/61-Y-eWXqtL._AC_UY218_.jpg",
      link: "https://www.amazon.in/s?k=laptop#"
    },
    {
      name: "Lenovo IdeaPad Slim 3 12th Gen Intel Core i5-12450H 14\" (35.5cm) FHD 250 Nits Thin & Light Laptop (16GB/512GB SSD/Win 11/Office 21/1Yr Warranty/Alexa built-in/3 mon. Game Pass/Grey/1.37Kg), 83EQ005VIN",
      price: "54,090",
      image: "https://m.media-amazon.com/images/I/81fvJauBWDL._AC_UY218_.jpg",
      link: "https://www.amazon.in/s?k=laptop#"
    },
    {
      name: "(Refurbished) Lenovo ThinkPad 8th Gen Intel Core i5 Thin & Light HD Laptop (16 GB DDR4 RAM/512 GB SSD/14 (35.6 cm) HD/Windows 11/MS Office/WiFi/Bluetooth 4.1/Webcam/Intel Graphics)",
      price: "17,050",
      image: "https://m.media-amazon.com/images/I/611AaVzaCQL._AC_UY218_.jpg",
      link: "https://www.amazon.in/Refurbished-Lenovo-ThinkPad-Bluetooth-Graphics/dp/B0DMTPY8PJ/ref=sr_1_3?dib=eyJ2IjoiMSJ9.RXkIJXGcyrRHMC07itcaEFD84cVNlAtA9l7X5VEk77I6YPoP2KjJ8FaWepy_0RSCbD33bNaMF0E6OImLqOk5lJKr_wEo9NDsIbAlXo_UweNHtJ17zzYCdl7UhmYM1GFWTUXTh1vXvBksnF5Zey0HXOcoua3Au0bdDJQOLgiOBZ4CTTyEWutSZlHgotp1vBQo43PVlubvSyhkRV9xjVC9Bvu8CBrdeozREL_F3kzITFA.yVHyny14k8jASbdpOTKF-o0dTZxy0S_uzR7-85C7bi4&dib_tag=se&keywords=laptop&qid=1739281010&sr=8-3"
    },
    {
      name: "Acer Aspire Lite AMD Ryzen 5-5625U Premium Thin and Light Laptop (16 GB RAM/512 GB SSD/Windows 11 Home) AL15-41, 39.62 cm (15.6\") Full HD Display, Metal Body, Steel Gray, 1.59 KG",
      price: "31,990",
      image: "https://m.media-amazon.com/images/I/61fDHkQ6MqL._AC_UY218_.jpg",
      link: "https://www.amazon.in/5-5625U-Premium-Windows-AL15-41-Display/dp/B0DG2GCTD7/ref=sr_1_4?dib=eyJ2IjoiMSJ9.RXkIJXGcyrRHMC07itcaEFD84cVNlAtA9l7X5VEk77I6YPoP2KjJ8FaWepy_0RSCbD33bNaMF0E6OImLqOk5lJKr_wEo9NDsIbAlXo_UweNHtJ17zzYCdl7UhmYM1GFWTUXTh1vXvBksnF5Zey0HXOcoua3Au0bdDJQOLgiOBZ4CTTyEWutSZlHgotp1vBQo43PVlubvSyhkRV9xjVC9Bvu8CBrdeozREL_F3kzITFA.yVHyny14k8jASbdpOTKF-o0dTZxy0S_uzR7-85C7bi4&dib_tag=se&keywords=laptop&qid=1739281010&sr=8-4"
    },
    {
      name: "Apple MacBook Air Laptop: Apple M1 chip, 13.3-inch/33.74 cm Retina Display, 8GB RAM, 256GB SSD Storage, Backlit Keyboard, FaceTime HD Camera, Touch ID. Works with iPhone/iPad; Space Grey",
      price: "67,990",
      image: "https://m.media-amazon.com/images/I/71jG+e7roXL._AC_UY218_.jpg",
      link: "https://www.amazon.in/Apple-MacBook-Chip-13-inch-256GB/dp/B08N5W4NNB/ref=sr_1_5?dib=eyJ2IjoiMSJ9.RXkIJXGcyrRHMC07itcaEFD84cVNlAtA9l7X5VEk77I6YPoP2KjJ8FaWepy_0RSCbD33bNaMF0E6OImLqOk5lJKr_wEo9NDsIbAlXo_UweNHtJ17zzYCdl7UhmYM1GFWTUXTh1vXvBksnF5Zey0HXOcoua3Au0bdDJQOLgiOBZ4CTTyEWutSZlHgotp1vBQo43PVlubvSyhkRV9xjVC9Bvu8CBrdeozREL_F3kzITFA.yVHyny14k8jASbdpOTKF-o0dTZxy0S_uzR7-85C7bi4&dib_tag=se&keywords=laptop&qid=1739281010&sr=8-5"
    }] });
     */
    res.json({products : products})
  } catch (error) {
    console.error("Error scraping Amazon:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/track" , (req,res) => {
  const {name , price , link , email} = req.body;
  if(!price || !link || !email){
    return res.status(400).json({error: "Missing parameters"});
  }

  trackProduct(name , price , link , email);
  res.json({ message: "Tracking started!", name});
})

app.get("/check-prices" , async (req , res) => {
  console.log("Checking price updates...")
  const productsDB = await TrackingProducts.find();
  console.log(productsDB);

  productsDB?.length > 0 && productsDB.map(async (product) => {
    const { name, price, link, affiliateLink, email } = product;
    const currentPrice = await getPrice(link);

    console.log(`Checking ${email}'s product: ${currentPrice}`);

    if (Number(currentPrice.replace(",", "")) < Number(price.replace(",", ""))) {
      console.log(`Price dropped for ${email}`);

      await sendEmail(email, name, affiliateLink, currentPrice);
    };

    res.json({success : true , message : "Price check completed"});
  })
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Connected to database")).catch((err) => console.log(err));
