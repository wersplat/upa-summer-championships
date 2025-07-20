import { Typography, Container, Box, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

export default function FAQPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          UPA Summer Championship
        </Typography>
        <Typography variant="h5" color="text.secondary">
          FAQ for Casual Fans & First-Time Viewers
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          ❓ What is the UPA Summer Championship?
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="A virtual 5v5 NBA 2K25 tournament hosted by Unified Pro-Am Association (UPA)."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Played on PlayStation 5 and Xbox Series X|S platforms."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Features top-tier Pro-Am teams from across North America."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="$15,000 prize pool, with serious bragging rights on the line."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          🏆 What's at Stake?
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="🥇 1st Place: $8,000" />
          </ListItem>
          <ListItem>
            <ListItemText primary="🥈 2nd Place: $4,500" />
          </ListItem>
          <ListItem>
            <ListItemText primary="🥉 3rd Place: $2,500" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Plus bonus recognition for MVPs and standout performances." />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          📅 Key Dates
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Registration Deadline: July 23, 2025" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Group Stage: Friday, July 25, 2025" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Main Bracket Play: Saturday–Sunday, July 26–27, 2025" />
          </ListItem>
          <ListItem>
            <ListItemText primary="All games are streamed live and organized to keep the action flowing all weekend." />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          🎮 How Does It Work?
        </Typography>
        <Typography paragraph>
          Team Entry Only: This year's event is team-based only—the draft phase has been cancelled.
        </Typography>
        <Typography paragraph>
          Teams must register with full rosters in advance (minimum 5 players, up to 7 max).
        </Typography>
        <Typography paragraph>
          Matches are played in private Pro-Am lobbies in NBA 2K25.
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold" mt={2}>
          The format includes:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Group Stage: Teams are split into groups for round-robin play." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Playoff Bracket: Top teams advance into a double-elimination bracket." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Grand Finals: A best-of-3 showdown to crown the champion." />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          👥 Who Can Participate?
        </Typography>
        <Typography paragraph>
          Only pre-formed teams (no solo player signups).
        </Typography>
        <Typography paragraph>
          Must play on Next Gen consoles (PS5 or Xbox Series X|S).
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          Teams are expected to:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="• Stream their games" />
          </ListItem>
          <ListItem>
            <ListItemText primary='• Use official team names that include "UPA"' />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Maintain competitive integrity and sportsmanship" />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          🧾 How Do I Register?
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Go to the official UPA registration page." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Select your team type and submit your roster." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Fees vary depending on registration package (typically $300–$350)." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Add-ons available for branding changes, roster edits, etc." />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          📺 Where Can I Watch?
        </Typography>
        <Typography paragraph>
          Every match is streamed or rebroadcast at:
        </Typography>
        <Typography paragraph sx={{ fontWeight: 'bold' }}>
          🎥 twitch.tv/unifiedproam
        </Typography>
        <Typography>
          Catch highlights and updates on social media:
        </Typography>
        <Typography sx={{ fontWeight: 'bold' }}>
          📸 @UnifiedProAm on Twitter/X
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          📏 Rules & Conduct
        </Typography>
        <Typography paragraph>
          Full rulebook is available on unifiedproam.gg.
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          Key expectations:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="• Players must be on registered rosters (no subs or ringers)." />
          </ListItem>
          <ListItem>
            <ListItemText primary="• All teams must stream matches with VODs saved." />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Collusion, cheating, or unsportsmanlike behavior = immediate disqualification." />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Roster locks apply once tournament play begins." />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          ❗ Why Should You Watch?
        </Typography>
        <Typography paragraph>
          It's where NBA 2K's elite Pro-Am teams battle for real money and reputation.
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          You'll see:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="• High-level strategy" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Precision shot timing" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Team chemistry under pressure" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Great intro to the Pro-Am scene if you've only played MyCareer or Rec." />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          📣 Stay Updated
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="• Follow announcements on UnifiedProAm.gg" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Join the official Discord (link on site)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Watch brackets & results update in real time during the weekend" />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
}
