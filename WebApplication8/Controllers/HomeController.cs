using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

public class HomeController : Controller
{
    public IActionResult Login()
    {
        return View();
    }

    [HttpPost]
    public IActionResult Login(string username, string password)
    {
        if (username == "admin" && password == "1234")
        {
            HttpContext.Session.SetString("loggedIn", "true"); // Store login status in session
            return RedirectToAction("Index");
        }
        ViewBag.ErrorMessage = "Invalid username or password!";
        return View();
    }

    public IActionResult Index()
    {
        // Check if user is logged in
        if (string.IsNullOrEmpty(HttpContext.Session.GetString("loggedIn")))
        {
            return RedirectToAction("Login");
        }
        return View();
    }

    public IActionResult Logout()
    {
        HttpContext.Session.Remove("loggedIn"); // Clear session on logout
        return RedirectToAction("Login");
    }
}