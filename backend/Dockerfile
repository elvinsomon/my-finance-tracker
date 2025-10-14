# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["FinanceManager.API/FinanceManager.API.csproj", "FinanceManager.API/"]
COPY ["FinanceManager.Core/FinanceManager.Core.csproj", "FinanceManager.Core/"]
COPY ["FinanceManager.Infrastructure/FinanceManager.Infrastructure.csproj", "FinanceManager.Infrastructure/"]
RUN dotnet restore "FinanceManager.API/FinanceManager.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/FinanceManager.API"
RUN dotnet build "FinanceManager.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "FinanceManager.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Copy published app
COPY --from=publish /app/publish .

# Set environment variable for database connection
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "FinanceManager.API.dll"]
