using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using HousingEstateManagement.Infrastructure.Persistence;
using HousingEstateManagement.Application.Interfaces.Repositories;
using HousingEstateManagement.Infrastructure.Repositories;
using HousingEstateManagement.Application.Interfaces.Services;
using HousingEstateManagement.Application.Services;
using HousingEstateManagement.Infrastructure.Services;
using HousingEstateManagement.API.Services.Background;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Dependency Injection
builder.Services.AddAutoMapper(typeof(HousingEstateManagement.Application.Mappings.MappingProfile));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IFinancialService, FinancialService>();
builder.Services.AddScoped<IElectionService, ElectionService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBlockService, BlockService>();
builder.Services.AddScoped<IJwtService, JwtService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings.GetValue<string>("SecretKey");

builder.Services.AddAuthentication(opt => {
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Add Background Services
builder.Services.AddHostedService<FinancialBackgroundService>();
builder.Services.AddHostedService<ElectionBackgroundService>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var application = builder.Build();

// ** Seed Database on Startup **
using (var scope = application.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        await HousingEstateManagement.API.Data.DbInitializer.InitializeAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database: {Message}. StackTrace: {StackTrace}", ex.Message, ex.StackTrace);
        if (ex.InnerException != null)
        {
            logger.LogError(ex.InnerException, "Inner Exception: {Message}", ex.InnerException.Message);
        }
    }
}

// Configure the HTTP request pipeline.
if (application.Environment.IsDevelopment())
{
    application.MapOpenApi();
}

application.UseMiddleware<HousingEstateManagement.API.Middleware.ExceptionMiddleware>();

// Root endpoint for visibility
application.MapGet("/", () => "Housing Estate Management API is running! 🚀");

// application.UseHttpsRedirection();


application.UseCors("AllowAll");

application.UseAuthentication();
application.UseAuthorization();

application.MapControllers();

application.Run();
