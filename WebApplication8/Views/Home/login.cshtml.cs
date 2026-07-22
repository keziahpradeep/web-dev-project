using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

public class LoginModel : PageModel
{
    [BindProperty] public string Username { get; set; } = "";
    [BindProperty] public string Password { get; set; } = "";
    public string LoginError { get; set; } = "";

    public void OnGet()
    {
        // Show the login page
    }

    public IActionResult OnPost(string? returnUrl = null)
    {
        if (Username == "admin" && Password == "1234")
        {
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                return LocalRedirect(returnUrl);
            return RedirectToPage("/Index");
        }
        LoginError = "Invalid username or password.";
        return Page();
    }
}
